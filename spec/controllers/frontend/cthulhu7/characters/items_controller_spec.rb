# frozen_string_literal: true

describe Frontend::Cthulhu7::Characters::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#load' do
    context 'for logged users' do
      context 'for invalid character' do
        let(:request) {
          post :load, params: {
            character_id: 'unexisting', item: { name: 'Item', kind: 'item' }, charkeeper_access_token: access_token
          }
        }

        it 'does not create item', :aggregate_failures do
          expect { request }.not_to change(Item, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for valid character' do
        let!(:character) { create :character, :cthulhu7, user: user_session.user }

        context 'for invalid params' do
          let(:request) {
            post :load, params: {
              character_id: character.id, item: { name: '', kind: 'item' }, charkeeper_access_token: access_token
            }
          }

          it 'does not create item', :aggregate_failures do
            expect { request }.not_to change(Item, :count)
            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'for valid params' do
          context 'for simple item' do
            let(:request) {
              post :load, params: {
                character_id: character.id, item: { name: 'Name', kind: 'item' }, charkeeper_access_token: access_token
              }
            }

            it 'creates item', :aggregate_failures do
              expect { request }.to(
                change(Item, :count).by(1)
                  .and(change(Character::Item, :count).by(1))
              )
              expect(response).to have_http_status :ok
            end
          end

          context 'for weapon item' do
            let(:request) {
              post :load, params: {
                character_id: character.id, item: {
                  name: 'Name', kind: 'weapon', data: {
                    skill: 'fighting', damage: '1d6', distance: '50 m', attacks: 1, with_damage_bonus: false
                  }
                }, charkeeper_access_token: access_token
              }
            }

            it 'creates item', :aggregate_failures do
              expect { request }.to(
                change(Item, :count).by(1)
                  .and(change(Character::Item, :count).by(1))
              )
              expect(response).to have_http_status :ok
            end
          end
        end
      end
    end
  end
end
