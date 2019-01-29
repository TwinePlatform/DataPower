import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { assocPath, compose, filter, pick, prop } from 'ramda';
import { Grid as Gr, Row, Col } from 'react-flexbox-grid';
import { Paragraph as P } from '../../shared/components/text/base';
import { Form as Fm, PrimaryButton } from '../../shared/components/form/base';
import LabelledInput from '../../shared/components/form/LabelledInput';
import LabelledSelect from '../../shared/components/form/LabelledSelect';
import NavHeader from '../../shared/components/NavHeader';
import DetailsTable from '../components/DetailsTable';
import QrBox from '../components/QrBox';
import { CommunityBusiness, Visitors, ErrorUtils } from '../../api';
import { renameKeys, redirectOnError } from '../../util';
import { BirthYear } from '../../shared/constants';
import PrintableQrCode from '../../shared/components/PrintableQrCode';

const Grid = styled(Gr) `
  @media print {
    display: none;
  }
`;

const Form = styled(Fm) `
  width: 100%;
`;

const Paragraph = styled(P) `
  width: 100%;
`;

const Button = styled(PrimaryButton) `
  width: 100%;
  height: 3em;
`;

const payloadFromState = compose(
  filter(Boolean),
  pick(['name', 'gender', 'email', 'birthYear', 'phoneNumber']),
  prop('form'),
);

const resendQrCodeState = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};
export default class VisitorProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id || null,
      name: null,
      gender: null,
      birthYear: null,
      email: null,
      phoneNumber: null,
      registeredAt: null,
      qrCodeUrl: '',
      isPrinting: false,
      resendQrCodeState: null,
      cbOrgName: '',
      cbLogoUrl: '',
      form: {},
      errors: {},
      genderList: [],
    };
  }

  componentDidMount() {
    CommunityBusiness.update() // used to check cookie permissions
      .then(() => Promise.all([
        Visitors.get({ id: this.props.match.params.id }),
        Visitors.genders(),
        CommunityBusiness.get({ fields: ['name', 'logoUrl'] }),
      ]))
      .then(([resVisitors, rGenders, resCb]) => {
        this.updateStateFromApi(resVisitors.data.result);
        this.setState({
          genderList: [{ id: -1, name: '' }].concat(rGenders.data.result).map(renameKeys({ id: 'key', name: 'value' })),
          cbOrgName: resCb.data.result.name,
          cbLogoUrl: resCb.data.result.logoUrl,
        });
      })
      .catch(error => redirectOnError(this.props.history.push, error, { 403: '/cb/confirm' }));
  }

  onClickPrint = () => {
    window.print();
  };

  onClickResend = () => {
    this.setState({ resendQrCodeState: resendQrCodeState.PENDING });
    Visitors.sendQrCode({ id: this.state.id })
      .then(() => this.setState({ resendQrCodeState: resendQrCodeState.SUCCESS }))
      .catch((err) => {
        if (ErrorUtils.errorStatusEquals(err, 400)) {
          this.setState({
            resendQrCodeState: resendQrCodeState.ERROR,
            errors: { ...this.state.errors, resendButton: err.response.data.error },
          });
        } else {
          redirectOnError(this.props.history.push, err);
        }
      },
      );
  };

  onChange = e => this.setState(assocPath(['form', e.target.name], e.target.value));

  onSubmit = (e) => {
    e.preventDefault();
    e.target.reset();

    Visitors.update({ ...payloadFromState(this.state), id: this.state.id })
      .then((res) => {
        this.updateStateFromApi(res.data.result);
      })
      .catch((error) => {
        this.setState({ errors: { ...this.state.errors, ...error.response.data.error } });
      });
  };

  updateStateFromApi = (data) => {
    this.setState({
      id: data.id,
      name: data.name,
      gender: data.gender,
      birthYear: data.birthYear,
      email: data.email,
      phoneNumber: data.phoneMumber,
      registeredAt: moment(data.createdAt).format('Do MMMM YYYY'),
      qrCodeUrl: data.qrCode,
      form: {},
      errors: {},
    });
  };

  renderMain(state) {
    const { errors, ...rest } = state;
    const rows = [
      { name: 'Visitor ID', value: rest.id },
      { name: 'Name', value: rest.name },
      { name: 'Gender', value: rest.gender },
      { name: 'Year of birth', value: rest.birthYear },
      { name: 'Email', value: rest.email },
      { name: 'Phone number', value: rest.phoneNumber },
      { name: 'Registration date', value: rest.registeredAt },
    ];

    return (
      <Grid>
        <NavHeader
          leftTo="/cb/dashboard"
          leftContent="Back to dashboard"
          centerContent="Visitor profile"
        />
        <Row between="xs">
          <Col xs={12} md={7}>
            <DetailsTable rows={rows} caption="Visitor details" />
          </Col>
          <Col xs={12} md={4}>
            <QrBox
              qrCodeUrl={rest.qrCodeUrl}
              print={this.onClickPrint}
              send={this.onClickResend}
              status={rest.resendQrCodeState}
              error={errors.resendButton}
            />
          </Col>
        </Row>
        <Paragraph>Edit user details</Paragraph>
        <Form onChange={this.onChange} onSubmit={this.onSubmit}>
          <Row between="xs" style={{ width: '100%' }}>
            <Col xs={12} md={7}>
              <LabelledInput
                id="visitor-name"
                label="Name"
                name="name"
                type="text"
                placeholder={rest.name}
                error={errors.name}
              />
              <LabelledInput
                id="visitor-email"
                label="Email"
                name="email"
                type="email"
                placeholder={rest.email}
                error={errors.email}
              />
              <Button type="submit">SAVE</Button>
            </Col>
            <Col xs={12} md={4}>
              <LabelledSelect
                id="visitor-birthYear"
                label="Year of birth"
                name="birthYear"
                options={BirthYear.defaultOptionsList()}
                value={rest.form.birthYear || rest.birthYear}
                error={errors.birthYear}
              />
              <LabelledSelect
                id="visitor-gender"
                label="Gender"
                name="gender"
                options={rest.genderList}
                value={rest.form.gender || rest.gender}
                error={errors.gender}
              />
            </Col>
          </Row>
        </Form>
      </Grid>
    );
  }

  render() {
    return (
      <React.Fragment>
        <PrintableQrCode cbLogoUrl={this.state.cbLogoUrl} qrCode={this.state.qrCodeUrl} />
        {this.renderMain(this.state)}
      </React.Fragment>
    );
  }
}

VisitorProfile.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};
