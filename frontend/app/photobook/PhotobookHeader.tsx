import React from "react";

export default function PhotobookHeader({
  title,
  description,
  isEditingTitle,
  editedTitle,
  onEditedTitleChange,
  onSaveTitle,
  onBeginEdit,
  onCancelEdit,
  selectedPage,
  totalPages,
}: {
  title: string;
  description: string;
  isEditingTitle: boolean;
  editedTitle: string;
  onEditedTitleChange: (value: string) => void;
  onSaveTitle: () => void;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  selectedPage: number;
  totalPages: number;
}) {
  return (
    <div className="photobook-header-container">
      {isEditingTitle ? (
        <div className="photobook-title-edit-container">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => onEditedTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSaveTitle();
              } else if (e.key === "Escape") {
                onCancelEdit();
              }
            }}
            className="photobook-title-input"
            autoFocus
          />
          <button onClick={onSaveTitle} className="photobook-title-button save">
            Save
          </button>
          <button onClick={onCancelEdit} className="photobook-title-button cancel">
            Cancel
          </button>
        </div>
      ) : (
        <h1
          className="photobook-title"
          onClick={onBeginEdit}
          title="Click to edit title"
        >
          {title}
        </h1>
      )}
      <p className="photobook-description">{description}</p>
      <div className="photobook-page-indicator">
        Page {selectedPage} of {totalPages}
      </div>
    </div>
  );
}
