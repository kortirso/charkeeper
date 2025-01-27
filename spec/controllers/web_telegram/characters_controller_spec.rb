# frozen_string_literal: true

describe WebTelegram::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :character, user: user_session.user
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { characters_access_token: access_token }

        response_values = response.parsed_body.dig('characters', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['characters'].size).to eq 1
        expect(response_values.keys).to contain_exactly('id', 'name', 'object_data', 'provider')
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      let!(:character) { create :character, user: user_session.user }

      it 'returns data', :aggregate_failures do
        get :show, params: { id: character.id, characters_access_token: access_token }

        response_values = response.parsed_body['character']

        expect(response).to have_http_status :ok
        expect(response_values.keys).to contain_exactly('id', 'name', 'object_data', 'decorated_data', 'provider')
      end

      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          get :show, params: { id: 'unexisting', characters_access_token: access_token }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq({ 'base' => ['Not found'] })
        end
      end
    end
  end
end
