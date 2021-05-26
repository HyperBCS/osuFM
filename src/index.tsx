import ReactDOM from 'react-dom';
import App from './App';
import ReactGA from 'react-ga';


ReactGA.initialize('UA-99921518-1');
ReactGA.pageview(window.location.pathname + window.location.search);

import reportWebVitals from './reportWebVitals';
import { Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  ReactGA.event({
    category: 'Web Vitals',
    action: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    label: metric.id,
    nonInteraction: true,
  });
}


ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendToAnalytics);