# frozen_string_literal: true

describe Web::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#show' do
    context 'for logged users' do
      context 'for not existing character' do
        it 'returns error' do
          get :show, params: { id: 'unexisting', charkeeper_access_token: access_token, format: :json }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not available character' do
        let!(:character) { create :character, :dnd2024, user: user_session.user }

        it 'returns error' do
          get :show, params: { id: character.id, charkeeper_access_token: access_token, format: :json }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for daggerheart' do
        let!(:character) { create :character, :daggerheart, user: user_session.user }

        it 'returns data' do
          get :show, params: { id: character.id, charkeeper_access_token: access_token, format: :json }

          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
