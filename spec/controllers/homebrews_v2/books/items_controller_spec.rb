# frozen_string_literal: true

describe HomebrewsV2::Books::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'POST#create' do
    context 'for logged users' do
      let!(:book) { create :homebrew_book, user: user_session.user }

      context 'for unexisting book' do
        let(:request) { post :create, params: { book_id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Homebrew::Book::Item, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for valid data' do
        let!(:homebrew) { create :homebrew, :daggerheart_transformation, user: user_session.user }
        let(:request) {
          post :create, params: {
            book_id: book.id,
            ids: [homebrew.id],
            itemable_type: 'Daggerheart::Homebrews::Transformation',
            charkeeper_access_token: access_token
          }
        }

        it 'creates item', :aggregate_failures do
          expect { request }.to change(Homebrew::Book::Item, :count).by(1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
