/* eslint-disable react/no-unused-state */
/* eslint-disable react/jsx-handler-names */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form, Dropdown } from 'react-bootstrap';

import { AUTO_LOOP_CENTRING, CLICK_CENTRING } from '../constants';

import GroupFolderInput from './GroupFolderInput.jsx';
import NumSnapshotsDropDown from './NumSnapshotsDropDown.jsx';

import {
  sendSetCentringMethod,
  sendSetGroupFolder,
  sendSetQueueSettings,
  setAutoAddDiffPlan,
  setAutoMountSample,
} from '../actions/queue';

class QueueSettings extends React.Component {
  constructor(props) {
    super(props);
    this.inputOnChangeHandler = this.inputOnChangeHandler.bind(this);
    this.setGroupFolderInput = this.setGroupFolderInput.bind(this);
    this.autoMountNextOnClick = this.autoMountNextOnClick.bind(this);
    this.setAutoAddDiffPlan = this.setAutoAddDiffPlan.bind(this);
    this.autoLoopCentringOnClick = this.autoLoopCentringOnClick.bind(this);

    this.inputValue = '';
    this.state = { validationState: 'success' };
  }

  setGroupFolderInput() {
    this.setState({ validationState: 'success' });
    /* eslint-enable react/no-set-state */
    this.props.sendSetGroupFolder(this.inputValue.value);
  }

  setAutoAddDiffPlan(e) {
    this.props.setAutoAddDiffPlan(e.target.checked);
  }

  inputOnChangeHandler() {
    this.setState({ validationState: 'warning' });
    /* eslint-enable react/no-set-state */
  }

  autoMountNextOnClick(e) {
    e.preventDefault();
    this.props.setAutoMountSample(e.target.checked);
  }

  inputOnSelectHandler(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }

  autoLoopCentringOnClick(e) {
    if (e.target.checked) {
      this.props.sendSetCentringMethod(AUTO_LOOP_CENTRING);
    } else {
      this.props.sendSetCentringMethod(CLICK_CENTRING);
    }
  }

  render() {
    return (
      <Dropdown className="queue-settings" autoClose="outside">
        <Dropdown.Toggle variant="outline-secondary">
          <span>
            <i className="fas fa-1x fa-cog" /> Settings
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Form.Check
              type="checkbox"
              name="autoMountNext"
              onChange={this.autoMountNextOnClick}
              checked={this.props.queueState.autoMountNext}
              label="Automount next sample"
            />
          </Dropdown.Item>
          <Dropdown.Item>
            <Form.Check
              type="checkbox"
              onChange={this.autoLoopCentringOnClick}
              name="autoLoopCentring"
              checked={
                this.props.queueState.centringMethod === AUTO_LOOP_CENTRING
              }
              label="Auto loop centring"
            />
          </Dropdown.Item>
          <Dropdown.Item>
            <Form.Check
              type="checkbox"
              name="autoAddDiffPlan"
              onChange={this.setAutoAddDiffPlan}
              checked={this.props.queueState.autoAddDiffplan}
              label="Auto add diffraction plan"
            />
          </Dropdown.Item>
          <Dropdown.Item>
            <Form.Check
              type="checkbox"
              name="rememberParametersBetweenSamples"
              onChange={(e) => {
                this.props.sendSetQueueSettings(
                  'rememberParametersBetweenSamples',
                  e.target.checked,
                );
              }}
              checked={this.props.queueState.rememberParametersBetweenSamples}
              label="Remember parameters between samples"
            />
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>
            <NumSnapshotsDropDown align="end" />
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>
            <GroupFolderInput />
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

function mapStateToProps(state) {
  return {
    queueState: state.queue,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    sendSetGroupFolder: bindActionCreators(sendSetGroupFolder, dispatch),
    setAutoAddDiffPlan: bindActionCreators(setAutoAddDiffPlan, dispatch),
    setAutoMountSample: bindActionCreators(setAutoMountSample, dispatch),
    sendSetCentringMethod: bindActionCreators(sendSetCentringMethod, dispatch),
    sendSetQueueSettings: bindActionCreators(sendSetQueueSettings, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueSettings);
