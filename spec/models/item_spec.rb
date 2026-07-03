# frozen_string_literal: true

describe Item do
  it 'factory should be valid' do
    item = build :item

    expect(item).to be_valid
  end

  describe '.clear_itemable' do
    let!(:feat) { create :daggerheart_feat }
    let!(:item) { create :item, :daggerheart, itemable: feat }

    context 'when deleting feat' do
      it 'clears itemable' do
        feat.destroy

        expect(described_class.find_by(id: item.id)).to be_nil
      end
    end

    context 'when deleting item' do
      it 'clears itemable' do
        item.destroy

        expect(described_class.find_by(id: item.id)).to be_nil
      end
    end

    context 'when discarding item' do
      it 'clears itemable' do
        item.discard

        expect(described_class.find_by(id: item.id)).not_to be_nil
      end
    end
  end
end
