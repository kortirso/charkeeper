# frozen_string_literal: true

describe WebTelegram::Dnd5::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before { create :spell }

      it 'returns data', :aggregate_failures do
        get :index, params: { characters_access_token: access_token, format: :json }

        response_values = response.parsed_body.dig('spells', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['spells'].size).to eq 1
        expect(response_values.keys).to contain_exactly('id', 'slug', 'name', 'level', 'available_for')
      end
    end
  end
end
