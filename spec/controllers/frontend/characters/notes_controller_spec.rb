# frozen_string_literal: true

describe Frontend::Characters::NotesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:character) { create :character }
  let!(:user_character) { create :character, user: user_session.user }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :index, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before do
          create :character_note, character: user_character
          create :character_note, character: character
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('notes', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['notes'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'title', 'value', 'markdown_value')
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: {
            character_id: 'unexisting', note: { title: 'title', value: 'value' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: {
            character_id: character.id, note: { title: 'title', value: 'value' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          post :create, params: {
            character_id: user_character.id, note: { title: 'title', value: 'value' }, charkeeper_access_token: access_token
          }
        }

        it 'creates character note', :aggregate_failures do
          expect { request }.to change(user_character.notes, :count).by(1)
          expect(response).to have_http_status :created
          expect(response.parsed_body['note'].keys).to contain_exactly('id', 'title', 'value', 'markdown_value')
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          delete :destroy, params: { character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          delete :destroy, params: { character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting note' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character note', :aggregate_failures do
            expect { request }.not_to change(Character::Note, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing note' do
          let!(:note) { create :character_note, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: note.id,
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character note', :aggregate_failures do
            expect { request }.to change(user_character.notes, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
