# frozen_string_literal: true

describe Frontend::Cthulhu7::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: { character: { name: 'Грундар' }, charkeeper_access_token: access_token }
      }

      it 'creates character', :aggregate_failures do
        expect { request }.to change(user_session.user.characters.cthulhu7, :count).by(1)
        expect(response).to have_http_status :created
      end

      context 'for invalid request' do
        let(:request) { post :create, params: { character: { name: '' }, charkeeper_access_token: access_token } }

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
      let!(:character) { create :character, :cthulhu7, user: user_session.user }
      let(:params) do
        { abilities: { str: 90, con: 80, siz: 70, dex: 60, app: 50, pow: 40, int: 40, edu: 40 } }
      end

      it 'updates character' do
        patch :update, params: { id: character.id, character: params, charkeeper_access_token: access_token }

        expect(response).to have_http_status :ok
      end

      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          patch :update, params: { id: 'unexisting', character: params, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq(['Запись не найдена'])
        end
      end

      context 'for invalid request' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: character.id, character: {
              abilities: { str: 90, con: 80, siz: 70, dex: 60, app: 50, pow: 40, int: 40, edu: 0 }
            }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :unprocessable_content
          expect(response.parsed_body['errors']['abilities.edu']).to eq(['Слишком маленькое значение'])
        end
      end
    end
  end
end
