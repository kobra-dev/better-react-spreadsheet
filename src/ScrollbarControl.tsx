import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core";

interface ScrollbarControlProps {
    nPages: number;
    onChange(position: number): void;
}

const useStyles = makeStyles((theme) => ({
    scrollbar: {
        height: "400px",
        overflowY: "scroll"
    },
    scrollbarContent: (props: { height: number }) => ({
        width: "0.01px",
        height: props.height + "px"
    })
}));

export default function ScrollbarControl(props: ScrollbarControlProps) {
    const [height, setHeight] = useState(1);
    const scrollbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function resize() {
            setHeight(scrollbarRef.current?.offsetHeight ?? 1);
        }
        resize();
        window.addEventListener("resize", resize);
        return () => window.removeEventListener("resize", resize);
    }, []);

    const styles = useStyles({ height: height * props.nPages });

    function onScroll(e: React.UIEvent<HTMLDivElement, UIEvent>) {
        //console.log(e);
        // @ts-ignore
        console.log(Math.floor(e.target.scrollTop / height));
    }

    return (
        <div
            className={styles.scrollbar}
            ref={scrollbarRef}
            onScroll={onScroll}
        >
            <div className={styles.scrollbarContent}></div>
        </div>
    );
}
