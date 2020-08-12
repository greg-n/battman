import React from "react";
import { AiFillGithub } from "react-icons/ai";

export default function InfoFooter(): JSX.Element {
    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                padding: ".6rem"
            }}
        >
            <a
                href="https://github.com/greg-n/battman"
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: "inherit" }}
            >
                <AiFillGithub size="1.6rem" />
            </a>
        </div>
    );
}
