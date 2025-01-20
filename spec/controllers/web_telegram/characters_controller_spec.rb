# frozen_string_literal: true

describe WebTelegram::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :dnd5_character
        user_character = create :dnd5_character

        create :user_character, user: user_session.user, characterable: user_character
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { characters_access_token: access_token, format: :json }

        response_values = response.parsed_body.dig('characters', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['characters'].size).to eq 1
        expect(response_values.keys).to contain_exactly('object_data', 'provider', 'user_character_id')
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      let!(:character) { create :dnd5_character }
      let!(:user_character) { create :user_character, user: user_session.user, characterable: character }

      it 'returns data', :aggregate_failures do
        get :show, params: { id: user_character.id, characters_access_token: access_token, format: :json }

        response_values = response.parsed_body['character']

        expect(response).to have_http_status :ok
        expect(response_values.keys).to contain_exactly('object_data', 'decorated_data', 'provider', 'user_character_id')
      end
    end
  end
end
