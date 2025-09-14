# frozen_string_literal: true

describe HomebrewContext::CopyBookCommand do
  subject(:command_call) { instance.call({ user: another_user, id: book.id }) }

  let(:instance) { described_class.new }
  let!(:another_user) { create :user }
  let!(:user) { create :user }
  let!(:book) { create :homebrew_book, user: user }
  let!(:race) { create :homebrew_race, :daggerheart, user: user }

  before do
    create :homebrew_book_item, homebrew_book: book, itemable_id: race.id, itemable_type: 'Daggerheart::Homebrew::Race'
  end

  it 'creates new items from book', :aggregate_failures do
    expect { command_call }.to change(Daggerheart::Homebrew::Race, :count).by(1)
    expect(command_call[:errors]).to be_nil
  end
end
