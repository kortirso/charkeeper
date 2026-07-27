# frozen_string_literal: true

describe Frontend::Dc20::Characters::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:user_character) do
    CharactersContext::Dc20::CreateCommand.new.call(
      user: user_session.user, name: 'name', main_class: 'wizard', ancestry_feats: {}
    )[:result]
  end
  let!(:spell) { create :feat, :rally, type: 'Dc20::Feat', origin: 7, origin_value: 'arcane', info: {} }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'without spells' do
          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['spells'].size).to eq 0
          end
        end

        context 'with spells' do
          before do
            create :character_feat, feat: spell, character: user_character
          end

          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['spells'].size).to eq 1
          end
        end
      end
    end
  end

  describe 'POST#clear' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :clear, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        let(:request) { post :clear, params: { character_id: user_character.id, charkeeper_access_token: access_token } }

        before do
          user_character.data.spell_class = 'bard'
          user_character.data.spell_filter = { 'schools' => %w[school] }
          user_character.save
        end

        context 'without spells' do
          it 'returns data', :aggregate_failures do
            request

            expect(response).to have_http_status :ok
            expect(user_character.reload.data.spell_class).to be_nil
          end
        end

        context 'with spells' do
          before { create :character_feat, feat: spell, character: user_character }

          it 'returns data', :aggregate_failures do
            expect { request }.to change(Character::Feat, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(user_character.reload.data.spell_class).to be_nil
          end
        end
      end
    end
  end
end
