import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write content here...', minHeight = 200, className = '' }) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['blockquote', 'code-block'],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image',
    'blockquote', 'code-block',
    'color', 'background',
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight: `${minHeight}px` }}
      />
      <style>{`
        .rich-text-editor .quill { border-radius: 0.375rem; }
        .rich-text-editor .ql-toolbar { border-color: rgb(209 213 219); border-radius: 0.375rem 0.375rem 0 0; background: #f9fafb; }
        .rich-text-editor .ql-container { border-color: rgb(209 213 219); border-radius: 0 0 0.375rem 0.375rem; min-height: ${minHeight}px; }
        .dark .rich-text-editor .ql-toolbar { border-color: rgb(75 85 99); background: rgb(55 65 81); }
        .dark .rich-text-editor .ql-container { border-color: rgb(75 85 99); }
        .rich-text-editor .ql-editor { min-height: ${minHeight}px; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
