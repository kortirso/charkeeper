# frozen_string_literal: true

describe HomebrewContext::Daggerheart::CopyBookCommand do
  subject(:command_call) { instance.call({ user: another_user, book: Homebrew::Book.find(book.id) }) }

  let(:instance) { described_class.new }
  let!(:another_user) { create :user }
  let!(:user) { create :user }
  let!(:book) { create :homebrew_book, user: user }
  let!(:race) { create :homebrew_race, :daggerheart, user: user }
  let!(:speciality) { create :homebrew_speciality, :daggerheart, user: user }
  let!(:subclass1) { create :homebrew_subclass, :daggerheart, user: user, class_name: 'bard' }
  let!(:subclass2) { create :homebrew_subclass, :daggerheart, user: user, class_name: 'bard' }
  let!(:subclass3) { create :homebrew_subclass, :daggerheart, user: user, class_name: speciality.id }
  let!(:subclass4) { create :homebrew_subclass, :daggerheart, user: user, class_name: speciality.id }

  before do
    create :homebrew_book_item, homebrew_book: book, itemable_id: race.id, itemable_type: 'Daggerheart::Homebrew::Race'
    create :homebrew_book_item, homebrew_book: book, itemable_id: subclass1.id, itemable_type: 'Daggerheart::Homebrew::Subclass'
    create :homebrew_book_item, homebrew_book: book, itemable_id: subclass2.id, itemable_type: 'Daggerheart::Homebrew::Subclass'
    create :homebrew_book_item, homebrew_book: book, itemable_id: subclass3.id, itemable_type: 'Daggerheart::Homebrew::Subclass'
    create :homebrew_book_item, homebrew_book: book, itemable_id: subclass4.id, itemable_type: 'Daggerheart::Homebrew::Subclass'
  end

  it 'creates new items from book', :aggregate_failures do
    expect { command_call }.to(
      change(Daggerheart::Homebrew::Race, :count).by(1)
        .and(change(Daggerheart::Homebrew::Speciality, :count).by(1))
        .and(change(Daggerheart::Homebrew::Subclass, :count).by(4))
    )
    expect(command_call[:errors]).to be_nil
  end
end
