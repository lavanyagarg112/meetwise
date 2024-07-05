import React from 'react'
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownView.module.css'

const MarkdownView = ({markdownContent}) => {
  return (
    <div>
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  )
}

export default MarkdownView
