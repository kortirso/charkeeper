# frozen_string_literal: true

describe Frontend::Dnd2024::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          character: {
            name: 'Грундар', species: 'human', size: 'medium', main_class: 'monk', alignment: 'neutral'
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
              name: 'Грундар', species: 'argh', size: 'medium', main_class: 'monk', alignment: 'neutral'
            }, charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Character, :count)
          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']).not_to be_nil
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      let!(:character) { create :character, :dnd2024, user: user_session.user }

      it 'updates character', :aggregate_failures do
        patch :update, params: {
          id: character.id, character: { classes: { bard: 12 } }, charkeeper_access_token: access_token
        }

        expect(response).to have_http_status :ok
        expect(character.reload.data.classes).to eq({ 'bard' => 12 })
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

          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']['classes']).to eq(['Недопустимый уровень'])
        end
      end
    end
  end

  describe 'POST#import' do
    context 'for logged users' do
      let(:request) {
        post :import, params: {
          provider: 'beyond',
          data: {
            name: 'Грундар', race: 'human', size: 'medium', main_class: 'monk', alignment: 'neutral',
            classes: { monk: 5 }, max_health: 30, selected_proficiencies: ['nature'],
            languages: %w[common gnomish dwarvish], money: 8_052,
            abilities: { str: 10, dex: 12, con: 14, int: 16, wis: 14, cha: 10 }
          }, charkeeper_access_token: access_token
        }
      }

      before { user_session.user.update(locale: 'en') }

      it 'creates character', :aggregate_failures do
        expect { request }.to change(user_session.user.characters, :count).by(1)
        expect(response).to have_http_status :created
        expect(Dnd2024::Character.last.data.classes).to eq({ 'monk' => 5 })
      end

      context 'for invalid request' do
        let(:request) {
          post :import, params: {
            provider: 'beyond',
            data: {
              name: '', race: 'human', size: 'medium', main_class: 'monk', alignment: 'neutral'
            }, charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Character, :count)
          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']).not_to be_nil
        end
      end
    end
  end
end
