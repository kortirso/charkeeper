# frozen_string_literal: true

describe WebTelegram::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before { create :item }

      it 'returns data', :aggregate_failures do
        get :index, params: { provider: 'dnd5', charkeeper_access_token: access_token }

        response_values = response.parsed_body.dig('items', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['items'].size).to eq 1
        expect(response_values.keys).to contain_exactly('id', 'slug', 'kind', 'name', 'data')
      end
    end
  end
end
