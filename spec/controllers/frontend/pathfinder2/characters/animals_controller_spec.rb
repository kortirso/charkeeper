# frozen_string_literal: true

describe Frontend::Pathfinder2::Characters::AnimalsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :pathfinder2 }
  let!(:user_character) { create :character, :pathfinder2, user: user_session.user }

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :show, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :show, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          get :show, params: { character_id: user_character.id, charkeeper_access_token: access_token }
        }

        context 'when companion does not exist' do
          it 'returns error' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'when companion exists' do
          before { create :character_companion, :pathfinder2_animal_companion, character: user_character }

          it 'returns data', :aggregate_failures do
            request

            expect(response).to have_http_status :ok
            expect(response.parsed_body['animal'].keys).to(
              contain_exactly(
                'id', 'name', 'caption', 'avatar', 'armor_class', 'health', 'health_max', 'health_temp', 'level',
                'perception', 'saving_throws_value', 'skills', 'speed', 'speeds'
              )
            )
          end
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: {
            character_id: 'unexisting', animal: { name: 'name' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          post :create, params: {
            character_id: character.id, animal: { name: 'name' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          post :create, params: {
            character_id: user_character.id, animal: { name: 'name', kind: 'wolf' }, charkeeper_access_token: access_token
          }
        }

        context 'for existing companion' do
          before { create :character_companion, :pathfinder2_animal_companion, character: user_character }

          it 'does not create companion', :aggregate_failures do
            expect { request }.not_to change(Pathfinder2::Character::AnimalCompanion, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for not existing companion' do
          it 'creates companion', :aggregate_failures do
            expect { request }.to change(Pathfinder2::Character::AnimalCompanion, :count).by(1)
            expect(response).to have_http_status :created
          end
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          patch :update, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          patch :update, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          patch :update, params: {
            character_id: user_character.id, animal: { name: 'Compy' }, charkeeper_access_token: access_token
          }
        }

        context 'for unexisting companion' do
          it 'returns error' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing companion' do
          let!(:companion) { create :character_companion, :pathfinder2_animal_companion, character: user_character }

          it 'updates character companion', :aggregate_failures do
            request

            expect(companion.reload.name).to eq 'Compy'
            expect(response).to have_http_status :ok
          end
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          delete :destroy, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          delete :destroy, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) {
          delete :destroy, params: { character_id: user_character.id, charkeeper_access_token: access_token }
        }

        context 'for unexisting companion' do
          it 'returns error', :aggregate_failures do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing companion' do
          before { create :character_companion, :pathfinder2_animal_companion, character: user_character }

          it 'deletes companion', :aggregate_failures do
            expect { request }.to change(Pathfinder2::Character::AnimalCompanion, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
