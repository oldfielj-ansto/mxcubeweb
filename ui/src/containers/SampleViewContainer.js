import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col, Container } from 'react-bootstrap';
import SampleImage from '../components/SampleView/SampleImage';
import MotorControls from '../components/SampleView/MotorControls';
import PhaseInput from '../components/SampleView/PhaseInput';
import ApertureInput from '../components/SampleView/ApertureInput';
import SSXChipControl from '../components/SSXChip/SSXChipControl';
import PlateManipulator from '../components/Equipment/PlateManipulator';
import ContextMenu from '../components/SampleView/ContextMenu';
import * as sampleViewActions from '../actions/sampleview'; // eslint-disable-line import/no-namespace
import { showErrorPanel, sendDisplayImage } from '../actions/general';
import { updateTask } from '../actions/queue';
import { showTaskForm } from '../actions/taskForm';
import BeamlineSetupContainer from './BeamlineSetupContainer';
import SampleQueueContainer from './SampleQueueContainer';
import { QUEUE_RUNNING } from '../constants';
import DefaultErrorBoundary from './DefaultErrorBoundary';
import { syncWithCrims } from '../actions/sampleGrid';
import {
  loadSample,
  refresh,
  selectWell,
  setPlate,
  selectDrop,
  sendCommand,
} from '../actions/sampleChanger';

import {
  setBeamlineAttribute,
  executeCommand,
  logFrontEndTraceBack,
  setAttribute,
} from '../actions/beamline';
import { stopBeamlineAction } from '../actions/beamlineActions';
import { find } from 'lodash';

class SampleViewContainer extends Component {
  constructor(props) {
    super(props);
    this.getControlAvailability = this.getControlAvailability.bind(this);
  }

  getControlAvailability(name) {
    const available = find(
      this.props.uiproperties.sample_view_video_controls.components,
      {
        id: name,
        show: true,
      },
    );

    return available?.show || false;
  }

  render() {
    const { uiproperties, hardwareObjects } = this.props;

    if (!('sample_view' in uiproperties)) {
      return null;
    }

    const motorUiProperties = uiproperties.sample_view.components.filter(
      ({ value_type }) => value_type === 'MOTOR',
    );

    const motorhardwareObjects = Object.values(hardwareObjects).filter(
      ({ type }) => type === 'MOTOR',
    );

    const { sourceScale, imageRatio, motorSteps } = this.props.sampleViewState;
    const { setStepSize } = this.props.sampleViewActions;
    const { currentSampleID } = this.props;
    const [points, lines, grids, twoDPoints] = [{}, {}, {}, {}];
    const selectedGrids = [];

    if (this.props.shapes !== undefined) {
      Object.keys(this.props.shapes).forEach((key) => {
        const shape = this.props.shapes[key];
        switch (shape.t) {
          case 'P': {
            points[shape.id] = shape;

            break;
          }
          case '2DP': {
            twoDPoints[shape.id] = shape;

            break;
          }
          case 'L': {
            lines[shape.id] = shape;

            break;
          }
          case 'G': {
            grids[shape.id] = shape;

            if (shape.selected) {
              selectedGrids.push(shape);
            }

            break;
          }
          // No default
        }
      });
    }
    const diffractometerHo = this.props.hardwareObjects.diffractometer;

    return (
      <Container fluid>
        <Row
          style={{
            background: '#fafafa',
            borderBottom: '1px solid lightgray',
            paddingBottom: '0em',
          }}
        >
          <Col sm={12}>
            <DefaultErrorBoundary>
              <BeamlineSetupContainer />
            </DefaultErrorBoundary>
          </Col>
        </Row>
        <Row className="gx-3 mt-2 pt-1">
          <Col sm={1}>
            <DefaultErrorBoundary>
              <div>
                <p className="motor-name">Phase Control:</p>
                <PhaseInput
                  phase={this.props.sampleViewState.currentPhase}
                  phaseList={this.props.sampleViewState.phaseList}
                  changePhase={this.props.sampleViewActions.changeCurrentPhase}
                  state={diffractometerHo.state}
                />
              </div>

              <div>
                <p className="motor-name">Beam size:</p>
                <ApertureInput
                  aperture={this.props.sampleViewState.currentAperture}
                  apertureList={this.props.sampleViewState.apertureList}
                  changeAperture={this.props.sampleViewActions.changeAperture}
                />
              </div>

              {this.props.mode === 'SSX-CHIP' ? (
                <SSXChipControl
                  showForm={this.props.showForm}
                  currentSampleID={currentSampleID}
                  sampleData={this.props.sampleList[currentSampleID]}
                  defaultParameters={this.props.defaultParameters}
                  groupFolder={this.props.groupFolder}
                  hardwareObjects={this.props.hardwareObjects}
                  uiproperties={uiproperties.sample_view}
                  sampleViewActions={this.props.sampleViewActions}
                  grids={grids}
                  selectedGrids={selectedGrids}
                  setAttribute={this.props.setAttribute}
                  sendExecuteCommand={this.props.sendExecuteCommand}
                />
              ) : null}
              {this.props.sampleChangerContents.name === 'PlateManipulator' ? (
                <PlateManipulator
                  contents={this.props.sampleChangerContents}
                  loadedSample={this.props.loadedSample}
                  select={this.props.select}
                  load={this.props.loadSample}
                  sendCommand={this.props.sendCommand}
                  refresh={this.props.refresh}
                  plates={this.props.plateGrid}
                  plateIndex={this.props.plateIndex}
                  selectedRow={this.props.selectedRow}
                  selectedCol={this.props.selectedCol}
                  selectedDrop={this.props.selectedDrop}
                  setPlate={this.props.setPlate}
                  selectWell={this.props.selectWell}
                  selectDrop={this.props.selectDrop}
                  crystalList={this.props.crystalList}
                  syncSamplesCrims={this.props.syncSamplesCrims}
                  showErrorPanel={this.props.showErrorPanel}
                  global_state={this.props.global_state}
                  state={this.props.sampleChangerState}
                  inPopover
                />
              ) : null}
              <MotorControls
                save={this.props.setAttribute}
                saveStep={setStepSize}
                uiproperties={motorUiProperties}
                hardwareObjects={motorhardwareObjects}
                motorsDisabled={
                  this.props.motorInputDisable ||
                  this.props.queueState === QUEUE_RUNNING
                }
                steps={motorSteps}
                stop={this.props.stopBeamlineAction}
                sampleViewActions={this.props.sampleViewActions}
                sampleViewState={this.props.sampleViewState}
              />
            </DefaultErrorBoundary>
          </Col>
          <Col sm={6}>
            <DefaultErrorBoundary>
              <ContextMenu
                {...this.props.contextMenu}
                getControlAvailability={this.getControlAvailability}
                sampleViewActions={this.props.sampleViewActions}
                updateTask={this.props.updateTask}
                availableMethods={this.props.availableMethods}
                showForm={this.props.showForm}
                sampleID={currentSampleID}
                sampleData={this.props.sampleList[currentSampleID]}
                defaultParameters={this.props.defaultParameters}
                imageRatio={imageRatio * sourceScale}
                workflows={this.props.workflows}
                savedPointId={this.props.sampleViewState.savedPointId}
                groupFolder={this.props.groupFolder}
                clickCentring={this.props.sampleViewState.clickCentring}
                taskForm={this.props.taskForm}
                enable2DPoints={this.props.enable2DPoints}
                enableNativeMesh={this.props.enableNativeMesh}
                showErrorPanel={this.props.showErrorPanel}
              />
              <SampleImage
                getControlAvailability={this.getControlAvailability}
                showErrorPanel={this.props.showErrorPanel}
                sampleViewActions={this.props.sampleViewActions}
                {...this.props.sampleViewState}
                uiproperties={uiproperties}
                hardwareObjects={this.props.hardwareObjects}
                steps={motorSteps}
                imageRatio={imageRatio * sourceScale}
                contextMenuVisible={this.props.contextMenu.show}
                shapes={this.props.shapes}
                points={points}
                twoDPoints={twoDPoints}
                lines={lines}
                grids={grids}
                selectedGrids={selectedGrids}
                cellCounting={this.props.cellCounting}
                cellSpacing={this.props.cellSpacing}
                currentSampleID={this.props.currentSampleID}
                sampleList={this.props.sampleList}
                proposal={this.props.proposal}
                busy={this.props.queueState === QUEUE_RUNNING}
                setAttribute={this.props.setAttribute}
                setBeamlineAttribute={this.props.setBeamlineAttribute}
                sendDisplayImage={this.props.sendDisplayImage}
                meshResultFormat={this.props.meshResultFormat}
              />
            </DefaultErrorBoundary>
          </Col>
          <Col sm={5} style={{ display: 'flex' }}>
            <DefaultErrorBoundary>
              <SampleQueueContainer />
            </DefaultErrorBoundary>
          </Col>
        </Row>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    sampleList: state.sampleGrid.sampleList,
    currentSampleID: state.queue.currentSampleID,
    groupFolder: state.queue.groupFolder,
    queueState: state.queue.queueStatus,
    sampleViewState: state.sampleview,
    contextMenu: state.contextMenu,
    motorInputDisable: state.beamline.motorInputDisable,
    hardwareObjects: state.beamline.hardwareObjects,
    availableMethods: state.beamline.availableMethods,
    defaultParameters: state.taskForm.defaultParameters,
    shapes: state.shapes.shapes,
    workflows: state.workflow.workflows,
    cellCounting: state.taskForm.defaultParameters.mesh.cell_counting,
    cellSpacing: state.taskForm.defaultParameters.mesh.cell_spacing,
    proposal: state.login.selectedProposal,
    remoteAccess: state.remoteAccess,
    uiproperties: state.uiproperties,
    taskForm: state.taskForm,
    mode: state.general.mode,
    enable2DPoints: state.general.enable2DPoints,
    meshResultFormat: state.general.meshResultFormat,
    enableNativeMesh: state.general.useNativeMesh,

    sampleChangerContents: state.sampleChanger.contents,
    sampleChangerState: state.sampleChanger.state,
    global_state: state.sampleChangerMaintenance.global_state,
    loadedSample: state.sampleChanger.loadedSample,
    plateGrid: state.sampleChanger.plateGrid,
    plateIndex: state.sampleChanger.currentPlateIndex,
    selectedRow: state.sampleChanger.selectedRow,
    selectedCol: state.sampleChanger.selectedCol,
    selectedDrop: state.sampleChanger.selectedDrop,
    crystalList: state.sampleGrid.crystalList,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    sampleViewActions: bindActionCreators(sampleViewActions, dispatch),
    updateTask: bindActionCreators(updateTask, dispatch),
    showForm: bindActionCreators(showTaskForm, dispatch),
    showErrorPanel: bindActionCreators(showErrorPanel, dispatch),
    setAttribute: bindActionCreators(setAttribute, dispatch),
    stopBeamlineAction: bindActionCreators(stopBeamlineAction, dispatch),
    setBeamlineAttribute: bindActionCreators(setBeamlineAttribute, dispatch),
    sendDisplayImage: bindActionCreators(sendDisplayImage, dispatch),
    sendExecuteCommand: bindActionCreators(executeCommand, dispatch),
    logFrontEndTraceBack: bindActionCreators(logFrontEndTraceBack, dispatch),

    loadSample: (address) => dispatch(loadSample(address)),
    refresh: () => dispatch(refresh()),
    selectWell: (row, col) => dispatch(selectWell(row, col)),
    setPlate: (address) => dispatch(setPlate(address)),
    selectDrop: (address) => dispatch(selectDrop(address)),
    syncSamplesCrims: () => dispatch(syncWithCrims()),
    sendCommand: (cmd, args) => dispatch(sendCommand(cmd, args)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SampleViewContainer);
