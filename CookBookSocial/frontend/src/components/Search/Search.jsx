import React, { useState, useEffect, useRef } from "react";
import algoliasearch from "algoliasearch";
import { InstantSearch, SearchBox, Hits, Highlight } from "react-instantsearch-dom";
import "./Search.css";
import { Link } from "react-router-dom";

const searchClient = algoliasearch("DEKII3BH6O", "fa19416e21b2be5963a65ad53ce49612");

const InstantSearchComponent = () => {
    const [showHits, setShowHits] = useState(false);
    const [query, setQuery] = useState("");
    const hitsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (hitsRef.current && !hitsRef.current.contains(event.target)) {
                setShowHits(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [hitsRef]);

    const handleSearch = (event) => {
        setQuery(event.currentTarget.value);
        setShowHits(event.currentTarget.value.length > 0);
    };

    return (
        <InstantSearch indexName="Recipe Titles" searchClient={searchClient} hitsPerPage={3}>
            <div className="max-w-2xl">
                <SearchBox
                    translations={{
                        placeholder: "Search for recipes...",
                    }}
                    onChange={handleSearch}
                    onFocus={() => setShowHits(query.length > 0)}
                />
                {showHits && query.length > 0 && (
                    <div ref={hitsRef}>
                        <Hits
                            hitComponent={Hit}
                            className="w-full max-w-xl absolute"
                            onClick={() => setShowHits(false)}
                        />
                    </div>
                )}
            </div>
        </InstantSearch>
    );
};

const Hit = ({ hit }) => {
    const recipeUrl = `/recipe/${hit.objectID}`;
    return (
        <Link
            to={recipeUrl}
            style={{
                display: "block",
                border: "1px solid gray",
                borderRadius: "5px",
                padding: "10px",
                margin: "0 0 -1px",
                textDecoration: "none",
                color: "inherit",
                transition: "background-color 0.3s ease-in-out",
                background: "white",
            }}
            onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#eee";
            }}
            onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
            }}
        >
            <div className="flex align-center max-w-xl mx-auto">
                <img
                    src={hit.image}
                    alt={hit.title}
                    style={{ width: "50px", height: "50px", marginRight: "10px" }}
                />
                <div style={{ maxWidth: "500px" }}>
                    <Highlight attribute="title" hit={hit} />
                </div>
            </div>
        </Link>
    );
};

export default InstantSearchComponent;
