import van from "vanjs-core";

const { section, br, p } = van.tags

const notFoundPage = () => {
  
  console.log("function notFoundPage", window.location.pathname);

  return () =>
    section(
      p({style: "text-align:center;"}, `page not found: ${window.location.pathname}`, br(), ':('),
    );
};

export default notFoundPage;
