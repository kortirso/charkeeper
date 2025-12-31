# frozen_string_literal: true

describe Homebrews::Daggerheart::BooksController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for Daggerheart' do
        let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }

        before do
          book = create :homebrew_book, user: user_session.user
          race = create :homebrew_race, :daggerheart, user: user_session.user
          create :homebrew_book_item, homebrew_book: book, itemable_id: race.id, itemable_type: 'Daggerheart::Homebrew::Race'
        end

        it 'returns data', :aggregate_failures do
          request

          expect(response).to have_http_status :ok
          expect(response.parsed_body['books'].size).to eq 1
        end
      end
    end
  end

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
        let!(:book) { create :homebrew_book, user: user_session.user }
        let(:request) { patch :update, params: { id: book.id, brewery: { public: true }, charkeeper_access_token: access_token } }

        it 'updates book', :aggregate_failures do
          request

          expect(book.reload.public?).to be_truthy
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
