const [showHeader, setShowHeader] = useState(true);
const lastScrollY = useRef(0);

useEffect(() => {
  const onScroll = () => {
    if (typeof window === "undefined") return;
    const currentY = window.scrollY;

    if (currentY <= 0) {
      setShowHeader(true);
      lastScrollY.current = 0;
      return;
    }

    if (currentY > lastScrollY.current) {
      // scrolling down
      setShowHeader(false);
    } else {
      // scrolling up
      setShowHeader(true);
    }
    lastScrollY.current = currentY;
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);
