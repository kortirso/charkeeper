# frozen_string_literal: true

describe HomebrewsContext::FindAvailableService do
  subject(:service_call) { described_class.new.call(user_id: user.id) }

  let!(:user) { create :user }
  let!(:own_race) { create :homebrew_race, :daggerheart, user: user }
  let!(:book_race) { create :homebrew_race, :daggerheart, name: 'Booked race' }

  before do
    book = create :homebrew_book, shared: true
    create :user_book, user: user, book: book
    create :homebrew_book_item, homebrew_book: book, itemable: book_race
  end

  it 'returns data' do
    expect(service_call.dig(:daggerheart, :races).keys).to contain_exactly(own_race.id, book_race.id)
  end
end
