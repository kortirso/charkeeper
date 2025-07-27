# frozen_string_literal: true

describe Frontend::Users::InfosController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#show' do
    context 'for logged users' do
      let(:request) { get :show, params: { charkeeper_access_token: access_token } }

      it 'renders user info', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body).to eq({
          'locale' => user_session.user.locale,
          'username' => user_session.user.username,
          'admin' => user_session.user.admin?,
          'color_schema' => user_session.user.color_schema
        })
      end
    end
  end
end
