import { useEffect } from "react";

export const LoadingCursor = (isLoading: boolean) => {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("loading");
    } else {
      document.body.classList.remove("loading");
    }
  }, [isLoading]);
};
