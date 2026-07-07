# frozen_string_literal: true

describe HomebrewsContext::RefreshUserDataService do
  subject(:service_call) { described_class.new.call(user: user) }

  let!(:user) { create :user }
  let!(:own_race) { create :homebrew, :daggerheart_ancestry, user: user }
  let!(:book_race) { create :homebrew, :daggerheart_ancestry, title: { en: 'Booked race' } }

  before do
    book = create :homebrew_book, shared: true
    create :user_book, user: user, book: book
    create :homebrew_book_item, homebrew_book: book, itemable: book_race
  end

  it 'returns data', :aggregate_failures do
    expect { service_call }.to change(User::Homebrew, :count).by(1)
    expect(User::Homebrew.last.data.dig('daggerheart', 'races').keys).to contain_exactly(own_race.id, book_race.id)
  end
end
