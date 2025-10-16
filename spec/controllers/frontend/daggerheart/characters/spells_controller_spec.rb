# frozen_string_literal: true

describe Frontend::Daggerheart::Characters::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:character) { create :character, :daggerheart }
  let!(:user_character) { create :character, :daggerheart, user: user_session.user, data: { main_class: 'bard' } }
  let!(:spell) { create :feat, :rally, origin: 7, origin_value: 'codex', conditions: { level: 1 } }

  describe 'GET#index' do
    context 'for logged users' do
      before { create :character_feat, feat: spell, character: user_character }

      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8' }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          get :index, params: { character_id: character.id, charkeeper_access_token: access_token, version: '0.3.8' }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        it 'returns data', :aggregate_failures do
          get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token, version: '0.3.8' }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response_values.keys).to(
            contain_exactly('id', 'ready_to_use', 'notes', 'slug', 'title', 'description')
          )
        end

        context 'for old app version' do
          it 'returns empty data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['spells'].size).to eq 0
          end
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8' }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        before { create :character_spell, character: character }

        it 'returns error' do
          post :create, params: { character_id: character.id, charkeeper_access_token: access_token, version: '0.3.8' }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting spell' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, spell_id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8'
            }
          }

          it 'does not create character spell', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Character::Feat, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id,
              spell_id: spell.id,
              charkeeper_access_token: access_token,
              version: '0.3.8'
            }
          }

          it 'creates character spell', :aggregate_failures do
            expect { request }.to change(user_character.feats, :count).by(1)
            expect(response).to have_http_status :created
            expect(response.parsed_body['spell'].keys).to(
              contain_exactly('id', 'ready_to_use', 'notes', 'slug', 'title', 'description')
            )
          end

          context 'for old app version' do
            let(:request) {
              post :create, params: {
                character_id: user_character.id,
                spell_id: spell.id,
                charkeeper_access_token: access_token
              }
            }

            it 'does not create character spell', :aggregate_failures do
              expect { request }.not_to change(Daggerheart::Character::Feat, :count)
              expect(response).to have_http_status :not_found
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
          patch :update, params: {
            character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          patch :update, params: {
            character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting spell' do
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: 'unexisting',
              character_spell: { ready_to_use: true },
              charkeeper_access_token: access_token,
              version: '0.3.8'
            }
          }

          it 'does not update character spell' do
            request

            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let!(:character_spell) { create :character_feat, feat: spell, character: user_character }
          let(:request) {
            patch :update, params: {
              character_id: user_character.id,
              id: character_spell.id,
              character_spell: { ready_to_use: true },
              charkeeper_access_token: access_token,
              version: '0.3.8'
            }
          }

          it 'updates character spell', :aggregate_failures do
            request

            expect(character_spell.reload.value['ready_to_use']).to be_truthy
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for old app version' do
            let(:request) {
              patch :update, params: {
                character_id: user_character.id,
                id: character_spell.id,
                character_spell: { ready_to_use: true },
                charkeeper_access_token: access_token
              }
            }

            it 'does not update character spell' do
              request

              expect(response).to have_http_status :not_found
            end
          end
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          delete :destroy, params: {
            character_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        it 'returns error' do
          delete :destroy, params: {
            character_id: character.id, id: 'unexisting', charkeeper_access_token: access_token, version: '0.3.8'
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'for unexisting spell' do
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: 'unexisting',
              charkeeper_access_token: access_token,
              version: '0.3.8'
            }
          }

          it 'does not delete character spell', :aggregate_failures do
            expect { request }.not_to change(Daggerheart::Character::Feat, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing spell' do
          let!(:character_spell) { create :character_feat, feat: spell, character: user_character }
          let(:request) {
            delete :destroy, params: {
              character_id: user_character.id,
              id: character_spell.id,
              charkeeper_access_token: access_token,
              version: '0.3.8'
            }
          }

          it 'deletes character spell', :aggregate_failures do
            expect { request }.to change(user_character.feats, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end

          context 'for old app version' do
            let(:request) {
              delete :destroy, params: {
                character_id: user_character.id,
                id: character_spell.id,
                charkeeper_access_token: access_token
              }
            }

            it 'does not delete character spell', :aggregate_failures do
              expect { request }.not_to change(Daggerheart::Character::Feat, :count)
              expect(response).to have_http_status :not_found
            end
          end
        end
      end
    end
  end
end
