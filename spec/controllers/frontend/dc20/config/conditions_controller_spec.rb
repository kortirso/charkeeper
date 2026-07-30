# frozen_string_literal: true

describe Frontend::Dc20::Config::ConditionsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      it 'returns data', :aggregate_failures do
        get :index, params: { charkeeper_access_token: access_token }

        expect(response).to have_http_status :ok
        expect(response.parsed_body['conditions'].size).to eq 28
      end
    end
  end
end
