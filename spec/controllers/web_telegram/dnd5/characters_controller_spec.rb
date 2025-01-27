# frozen_string_literal: true

describe WebTelegram::Dnd5::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'PATCH#update' do
    context 'for logged users' do
      let!(:character) { create :character, user: user_session.user }

      it 'updates character', :aggregate_failures do
        patch :update, params: {
          id: character.id, character: { classes: { monk: 12 } }, characters_access_token: access_token
        }

        expect(response).to have_http_status :ok
        expect(character.reload.data.classes).to eq({ 'monk' => 12 })
      end

      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: 'unexisting', character: { classes: { monk: 12 } }, characters_access_token: access_token
          }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq({ 'base' => ['Not found'] })
        end
      end

      context 'for invalid request' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: character.id, character: { classes: { monk: 31 } }, characters_access_token: access_token
          }

          expect(response).to have_http_status :unprocessable_entity
          expect(response.parsed_body['errors']).to eq({ 'classes' => ['Invalid level'] })
        end
      end
    end
  end
end
