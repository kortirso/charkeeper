# frozen_string_literal: true

describe HomebrewsV2::Daggerheart::BooksController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let(:request) { get :index, params: { charkeeper_access_token: access_token } }

      before do
        book = create :homebrew_book, user: user_session.user
        create :homebrew_book, shared: true
        item = create :homebrew, :daggerheart_transformation, user: user_session.user
        create :homebrew_book_item, homebrew_book: book, itemable: item
      end

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['homebrews'].size).to eq 2
        expect(response.parsed_body.dig('homebrews', 0).keys).to(
          contain_exactly('id', 'title', 'provider', 'shared', 'public', 'enabled', 'own')
        )
      end
    end
  end

  describe 'GET#for_items' do
    context 'for logged users' do
      let(:request) { get :for_items, params: { charkeeper_access_token: access_token } }

      before do
        create :homebrew_book, user: user_session.user
        create :homebrew_book, shared: true
      end

      it 'returns data', :aggregate_failures do
        request

        expect(response).to have_http_status :ok
        expect(response.parsed_body['books'].size).to eq 1
        expect(response.parsed_body.dig('books', 0).keys).to contain_exactly('id', 'title')
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for invalid data' do
        let(:request) { post :create, params: { book: { name: '' }, charkeeper_access_token: access_token } }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(Homebrew::Book, :count)
          expect(response).to have_http_status :unprocessable_content
        end
      end

      context 'for valid data' do
        let(:request) { post :create, params: { book: { name: 'Book' }, charkeeper_access_token: access_token } }

        it 'creates book', :aggregate_failures do
          expect { request }.to change(Homebrew::Book, :count)
          expect(response).to have_http_status :created
        end
      end

      context 'for valid data with existing name' do
        let(:request) { post :create, params: { book: { name: 'Book' }, charkeeper_access_token: access_token } }

        before { create :homebrew_book, user: user_session.user, name: 'Book' }

        it 'creates book', :aggregate_failures do
          expect { request }.to change(Homebrew::Book, :count)
          expect(response).to have_http_status :created
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting book' do
        let(:request) { delete :destroy, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(User::Book, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing book' do
        let!(:book) { create :homebrew_book, user: user_session.user }
        let(:request) { delete :destroy, params: { id: book.id, charkeeper_access_token: access_token } }

        it 'updates book', :aggregate_failures do
          expect { request }.to change(Homebrew::Book, :count).by(-1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end
end
