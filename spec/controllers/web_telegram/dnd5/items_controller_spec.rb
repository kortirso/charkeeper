# frozen_string_literal: true

describe WebTelegram::Dnd5::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before { create :dnd5_item }

      it 'returns data', :aggregate_failures do
        get :index, params: { characters_access_token: access_token, format: :json }

        response_values = response.parsed_body.dig('items', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['items'].size).to eq 1
        expect(response_values.keys).to contain_exactly('id', 'kind', 'name', 'weight', 'price', 'data')
      end
    end
  end
end
