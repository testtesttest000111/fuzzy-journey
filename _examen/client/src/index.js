import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ArticlesList from './ArticlesList';
import ReferencesList from './ReferencesList';


ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<ArticlesList />} />
      <Route path="/:id/references" element={<ReferencesList />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);

