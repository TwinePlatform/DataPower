import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BeatLoader } from 'react-spinners';
import { parse } from 'querystring';
import { Heading, Paragraph } from '../../shared/components/text/base';
import { FlexContainerCol } from '../../shared/components/layout/base';
import DotButton from '../../shared/components/form/DottedButton';
import NavHeader from '../../shared/components/NavHeader';
import { Visitors, ResponseUtils, ErrorUtils } from '../../api';
import { colors } from '../../shared/style_guide';


const StyledSection = styled.section`
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
`;

const ErrorText = styled(Paragraph)`
  color: ${colors.error};
`;

const status = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  REDIRECT: 'REDIRECT',
  FAILURE: 'FAILURE',
};

export default class ConfirmRole extends Component {
  constructor(props) {
    super(props);

    const { props: { location: { search } } } = this;
    const { role } = parse(search.replace('?', ''));

    this.state = {
      status: status.PENDING,
      role,
    };
  }

  componentDidMount() {
    const { props: { location: { search }, match: { params: { token } } } } = this;
    const { userId, organisationId, role } = parse(search.replace('?', ''));
    Visitors.addRole({ token, userId, organisationId, role: role && role.toUpperCase() })
      .then((r) => {
        console.log({ r });

        const res = ResponseUtils.getResponse(r);
        console.log({ res });

        return res.token
          ? this.setState({ status: status.REDIRECT, user: res })
          : this.setState({ status: status.SUCCESS });
      })
      .catch((e) => {
        console.log(e);

        this.setState({
          status: status.FAILURE,
          errors: ErrorUtils.getErrorMessage(e),
        })
        ;
      });
  }

  render() {
    return (
      <FlexContainerCol justify="flex-start">
        <NavHeader
          centerContent={
            <Heading>Add {this.state.role} Role</Heading>
          }
        />
        <StyledSection>
          {this.state.status === status.PENDING && (
            <BeatLoader
              color={colors.highlight_primary}
              sizeUnit={'px'}
              size={15}
            />
          )}
          {this.state.status === status.SUCCESS && (
            <Paragraph>
            Visitor account has been created. See email for QR code.
            </Paragraph>
          )}
          {this.state.status === status.REDIRECT && (
            <Redirect to={{ pathname: `/password/reset/${this.state.user.token}?email=${this.state.user.email}` }} />
          )}
          {this.state.status === status.FAILURE && (
            <>
              <ErrorText>{this.state.errors}</ErrorText>
              <Paragraph>
               Sorry there has been an error creating your account.
               Please talk to your Community Business about setting up an account
              </Paragraph>
            </>
          )}

        </StyledSection>
      </FlexContainerCol>
    );
  }
}

ConfirmRole.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  match: PropTypes.shape({ params: PropTypes.string }).isRequired,
};