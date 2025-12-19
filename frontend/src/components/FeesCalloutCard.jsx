import React from 'react';
import './FeesCalloutCard.css';

const INDEX_FEE = 0.03;
const ACTIVE_FEE = 1.0;
const BASE_AMOUNT = 10000;

const formatFee = (fee) => `${fee.toFixed(2)}% / yr`;
const formatDollars = (fee) => `$${((fee / 100) * BASE_AMOUNT).toFixed(0)} per $${BASE_AMOUNT.toLocaleString()} / yr`;

const FeesCalloutCard = ({ blueOffset = '8%', greenOffset = '60%' }) => (
  <div
    className="fees-card"
    style={{ '--fees-blue-offset': blueOffset, '--fees-green-offset': greenOffset }}
  >
    <div className="fees-card__header">
      <div className="fees-card__title">Fees vs Index</div>
      <div className="fees-card__chip">Active fees are ~33× higher</div>
    </div>

    <div className="fees-card__rows">
      <div className="fees-card__row fees-card__row--blue">
        <div className="fees-card__bullet fees-card__bullet--blue" aria-hidden />
        <div className="fees-card__copy">
          <div className="fees-card__label">Index fund fees</div>
          <div className="fees-card__value">{formatDollars(INDEX_FEE)}</div>
          <div className="fees-card__note">{formatFee(INDEX_FEE)} — low-cost index tracking</div>
        </div>
      </div>
      <div className="fees-card__row fees-card__row--green">
        <div className="fees-card__bullet fees-card__bullet--green" aria-hidden />
        <div className="fees-card__copy">
          <div className="fees-card__label">Active fund fees</div>
          <div className="fees-card__value">{formatDollars(ACTIVE_FEE)}</div>
          <div className="fees-card__note">{formatFee(ACTIVE_FEE)} — management + operating fees</div>
        </div>
      </div>
    </div>

    {/* <div className="fees-card__footer">
      Fees reduce returns over time, making it harder to beat the index.
    </div> */}
  </div>
);

export default FeesCalloutCard;
