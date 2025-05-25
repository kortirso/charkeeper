# frozen_string_literal: true

describe WebTelegram::Dnd5::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          character: {
            name: 'Грундар', race: 'human', main_class: 'monk', alignment: 'neutral'
          }, charkeeper_access_token: access_token
        }
      }

      it 'creates character', :aggregate_failures do
        expect { request }.to change(user_session.user.characters, :count).by(1)
        expect(response).to have_http_status :created
      end

      context 'for invalid request' do
        let(:request) {
          post :create, params: {
            character: {
              name: 'Грундар', race: 'argh', main_class: 'monk', alignment: 'neutral'
            }, charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Character, :count)
          expect(response).to have_http_status :unprocessable_entity
          expect(response.parsed_body['errors']).not_to be_nil
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      let!(:character) { create :character, user: user_session.user }

      it 'updates character', :aggregate_failures do
        patch :update, params: {
          id: character.id, character: { classes: { monk: 12 } }, charkeeper_access_token: access_token
        }

        expect(response).to have_http_status :ok
        expect(character.reload.data.classes).to eq({ 'monk' => 12 })
      end

      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: 'unexisting', character: { classes: { monk: 12 } }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq(['Запись не найдена'])
        end
      end

      context 'for invalid request' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: character.id, character: { classes: { monk: 31 } }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :unprocessable_entity
          expect(response.parsed_body['errors']).to eq(['Недопустимый уровень'])
        end
      end
    end
  end
end
