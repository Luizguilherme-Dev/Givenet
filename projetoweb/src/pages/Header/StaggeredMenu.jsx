import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./StaggeredMenu.css";

export const StaggeredMenu = ({
  position = "left",
  colors = ["#B497CF", "#5227FF"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl,
  menuButtonColor = "#fff",
  openMenuButtonColor = "#fff",
  accentColor = "#5227FF",
  changeMenuColorOnOpen = true,
  isFixed = true,
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const [textLines, setTextLines] = useState(["Menu", "Close"]);
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel || !plusHRef.current || !plusVRef.current || !iconRef.current || !textInnerRef.current) return;

      const preLayers = preContainer ? Array.from(preContainer.querySelectorAll(".sm-prelayer")) : [];
      preLayerElsRef.current = preLayers;
      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) gsap.set(preContainer, { opacity: 1 });
      gsap.set(plusHRef.current, { transformOrigin: "50% 50%", rotate: 0 });
      gsap.set(plusVRef.current, { transformOrigin: "50% 50%", rotate: 90 });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: "50% 50%" });
      gsap.set(textInnerRef.current, { yPercent: 0 });
      gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel"));
    const numberEls = Array.from(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"));
    const socialTitle = panel.querySelector(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link"));
    const offscreen = position === "left" ? -100 : 100;
    const tl = gsap.timeline({ paused: true });

    gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    gsap.set(numberEls, { "--sm-num-opacity": 0 });
    gsap.set(socialTitle, { opacity: 0 });
    gsap.set(socialLinks, { y: 25, opacity: 0 });

    layers.forEach((layer, index) => {
      tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: "power4.out" }, index * 0.07);
    });

    const panelStart = layers.length * 0.07 + (layers.length ? 0.08 : 0);
    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: 0.65, ease: "power4.out" }, panelStart);
    tl.to(itemEls, { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: 0.1 }, panelStart + 0.1);
    tl.to(numberEls, { "--sm-num-opacity": 1, duration: 0.6, ease: "power2.out", stagger: 0.08 }, panelStart + 0.2);
    tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, panelStart + 0.35);
    tl.to(socialLinks, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.08 }, panelStart + 0.4);
    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    const all = [...preLayerElsRef.current, panelRef.current].filter(Boolean);
    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      onComplete: () => { busyRef.current = false; }
    });
  }, [position]);

  const toggleMenu = useCallback(() => {
    if (busyRef.current) return;
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    busyRef.current = true;

    if (target) {
      onMenuOpen?.();
      const timeline = buildOpenTimeline();
      timeline?.eventCallback("onComplete", () => { busyRef.current = false; }).play(0);
    } else {
      onMenuClose?.();
      playClose();
    }

    gsap.to(iconRef.current, { rotate: target ? 225 : 0, duration: target ? 0.8 : 0.35, ease: "power4.out" });
    if (changeMenuColorOnOpen) {
      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap.to(toggleBtnRef.current, {
        color: target ? openMenuButtonColor : menuButtonColor,
        delay: 0.18,
        duration: 0.3
      });
    }

    const currentLabel = target ? "Menu" : "Close";
    const targetLabel = target ? "Close" : "Menu";
    const sequence = [currentLabel, targetLabel, currentLabel, targetLabel, targetLabel];
    setTextLines(sequence);
    gsap.set(textInnerRef.current, { yPercent: 0 });
    textCycleAnimRef.current?.kill();
    textCycleAnimRef.current = gsap.to(textInnerRef.current, {
      yPercent: -((sequence.length - 1) / sequence.length) * 100,
      duration: 0.85,
      ease: "power4.out"
    });
  }, [buildOpenTimeline, playClose, onMenuOpen, onMenuClose, changeMenuColorOnOpen, openMenuButtonColor, menuButtonColor]);

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    onMenuClose?.();
    playClose();
    gsap.to(iconRef.current, { rotate: 0, duration: 0.35, ease: "power3.inOut" });
  }, [playClose, onMenuClose]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return undefined;
    const handleClickOutside = event => {
      if (!panelRef.current?.contains(event.target) && !toggleBtnRef.current?.contains(event.target)) closeMenu();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOnClickAway, open, closeMenu]);

  return (
    <div
      className={`${className ? `${className} ` : ""}staggered-menu-wrapper${isFixed ? " fixed-wrapper" : ""}`}
      style={{ "--sm-accent": accentColor }}
      data-position={position}
      data-open={open || undefined}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(colors.length ? colors.slice(0, 3) : ["#1e1e22", "#35353c"]).map((color, index) => (
          <div key={index} className="sm-prelayer" style={{ background: color }} />
        ))}
      </div>

      <header className="staggered-menu-header" aria-label="Navegacao principal">
        <div className="sm-logo" aria-label="Give Net">
          {logoUrl && <img src={logoUrl} alt="Give Net" className="sm-logo-img" draggable={false} />}
        </div>
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              {textLines.map((line, index) => <span className="sm-toggle-line" key={index}>{line}</span>)}
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
        <a className="sm-profile-icon" href="/perfil" aria-label="Abrir perfil" title="Meu perfil">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </a>
      </header>

      <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items.map((item, index) => (
              <li className="sm-panel-itemWrap" key={`${item.label}-${index}`}>
                <a className="sm-panel-item" href={item.link} aria-label={item.ariaLabel} onClick={closeMenu}>
                  <span className="sm-panel-itemLabel">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials" aria-label="Redes sociais">
              <h3 className="sm-socials-title">Redes sociais</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((social, index) => (
                  <li key={`${social.label}-${index}`}>
                    <a href={social.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">{social.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
