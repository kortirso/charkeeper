# frozen_string_literal: true

describe Frontend::Pathfinder2::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let(:request) {
        post :create, params: {
          character: {
            name: 'Грундар', race: 'human', subrace: 'versatile_human', main_class: 'witch', background: 'barrister'
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
              name: 'Грундар', race: 'argh', subrace: 'versatile_human', main_class: 'witch', background: 'barrister'
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
      let!(:character) { create :character, :pathfinder2, user: user_session.user }

      it 'updates character', :aggregate_failures do
        patch :update, params: {
          id: character.id, character: { level: 5 }, charkeeper_access_token: access_token
        }

        expect(response).to have_http_status :ok
        expect(character.reload.data.level).to eq 5
      end

      context 'for rogue' do
        before do
          character.data['level'] = 5
          character.data['main_class'] = 'rogue'
          character.save
        end

        it 'updates character', :aggregate_failures do
          patch :update, params: {
            id: character.id, character: { level: 6 }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :ok
          expect(character.reload.data.level).to eq 6
        end
      end

      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          patch :update, params: {
            id: 'unexisting', character: { level: 5 }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq(['Запись не найдена'])
        end
      end
    end
  end
end
