# frozen_string_literal: true

describe Frontend::Daggerheart::Characters::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :daggerheart }
  let!(:user_character) { create :character, :daggerheart, user: user_session.user, data: { main_class: 'bard' } }
  let!(:spell) { create :spell, :daggerheart, data: { domain: 'codex' } }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        before { create :character_spell, character: character }

        it 'returns error' do
          get :index, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        before { create :character_spell, character: user_character }

        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly('id', 'ready_to_use', 'notes', 'level', 'slug', 'name')
          )
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        before { create :character_spell, character: character }

        it 'returns error' do
          post :create, params: { character_id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting spell' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, spell_id: 'unexisting', charkeeper_access_token: access_token
            }
          }

          it 'does not create character spell', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Character::Spell, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id,
              spell_id: spell.id,
              charkeeper_access_token: access_token
            }
          }

          it 'creates character spell', :aggregate_failures do
            expect { request }.to change(user_character.spells, :count).by(1)
            expect(response).to have_http_status :created
            expect(response.parsed_body['spell'].keys).to(
              contain_exactly('id', 'ready_to_use', 'notes', 'level', 'slug', 'name')
            )
          end

          context 'for invalid spell data' do
            before { spell.update!(data: { codex: 'splendor' }) }

            it 'does not create character spell', :aggregate_failures do
              expect { request }.not_to change(Daggerheart::Character::Spell, :count)
              expect(response).to have_http_status :unprocessable_entity
            end
          end
        end
      end
    end
  end

  describe 'PATCH#update' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          patch :update, params: { character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          patch :update, params: { character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting spell' do
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: 'unexisting',
              ready_to_use: true,
              charkeeper_access_token: access_token
            }
          }

          it 'does not update character spell' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let!(:character_spell) { create :character_spell, spell: spell, character: user_character }
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: character_spell.id,
              ready_to_use: true,
              charkeeper_access_token: access_token
            }
          }

          it 'updates character spell', :aggregate_failures do
            request

            expect(character_spell.reload.data['ready_to_use']).to be_truthy
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
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
        context 'for unexisting spell' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete character spell', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Character::Spell, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let!(:character_spell) { create :character_spell, spell: spell, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: character_spell.id,
              charkeeper_access_token: access_token
            }
          }

          it 'deletes character spell', :aggregate_failures do
            expect { request }.to change(user_character.spells, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
