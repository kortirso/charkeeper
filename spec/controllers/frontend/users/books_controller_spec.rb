# frozen_string_literal: true

describe Frontend::Users::BooksController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'PATCH#update' do
    context 'for logged users' do
      context 'for unexisting book' do
        let(:request) { patch :update, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(User::Book, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing book' do
        let!(:book) { create :homebrew_book, shared: true }
        let(:request) { patch :update, params: { id: book.id, charkeeper_access_token: access_token } }

        it 'attaches book to user', :aggregate_failures do
          expect { request }.to change(user_session.user.books, :count).by(1)
          expect(response).to have_http_status :ok
        end

        context 'when book is attached' do
          before { create :user_book, user: user_session.user, book: book }

          it 'deattaches book from user', :aggregate_failures do
            expect { request }.to change(user_session.user.books, :count).by(-1)
            expect(response).to have_http_status :ok
          end
        end
      end
    end
  end
end
