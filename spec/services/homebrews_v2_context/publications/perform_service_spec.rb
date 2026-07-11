# frozen_string_literal: true

describe HomebrewsV2Context::Publications::PerformService do
  subject(:service_call) { described_class.new.call(publication: publication) }

  let!(:publication) { create :homebrew_publication, parent_type: 'transformation' }

  context 'for valid transformation' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/transformation.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Transformation, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid ancestry' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/ancestry.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'ancestry')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Ancestry, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid community' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/community.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'community')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Community, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid speciality' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/speciality.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'speciality')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Speciality, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid subclass' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/subclass.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'subclass')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Subclass, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid domain' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/domain.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'domain')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Domain, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for valid mechanic' do
    let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/mechanic.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
      publication.update(parent_type: 'mechanic')
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to(
        change(Daggerheart::Homebrews::Mechanic, :count).by(1)
          .and(change(Daggerheart::Homebrews::MechanicItem, :count).by(1))
      )
      expect(publication.reload.errors_list).to eq({})
    end
  end

  context 'for updating' do
    context 'for existing record' do
      let!(:ancestry) {
        create :homebrew, :daggerheart_ancestry, id: 'd73d81a6-e3c3-40b0-8865-4af1c8370b36', user: publication.user
      }
      let!(:feat1) {
        create :daggerheart_feat,
               origin: 0,
               origin_value: 'd73d81a6-e3c3-40b0-8865-4af1c8370b36',
               id: 'b16b039c-75c8-45c0-ab6b-f39dc39fff21'
      }
      let!(:feat2) { create :daggerheart_feat, origin: 0, origin_value: 'd73d81a6-e3c3-40b0-8865-4af1c8370b36' }
      let!(:character_feat) { create :character_feat, feat: feat1, tokens: 1 }
      let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/ancestry_edit.json') }
      let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

      before do
        publication.file.attach(file)
        publication.update(parent_type: 'ancestry')
      end

      it 'calls import command', :aggregate_failures do
        expect { service_call }.not_to change(Daggerheart::Homebrews::Ancestry, :count)
        expect(publication.reload.errors_list).to eq({})
        expect(ancestry.reload.title['en']).to eq "Changed ancestry's title"
        expect(feat1.reload.title['en']).to eq "Changed feature's title"
        expect(Feat.find_by(id: feat2.id)).to be_nil
        expect(Feat.where(origin_value: ancestry.id).count).to eq 2
        expect(character_feat.reload.tokens).to be_nil
      end
    end

    context 'for unexisting record' do
      let!(:ancestry) {
        create :homebrew, :daggerheart_ancestry, id: 'd73d81a6-e3c3-40b0-8865-4af1c8370b37', user: publication.user
      }
      let(:file_path) { Rails.root.join('spec/fixtures/daggerheart/ancestry_edit.json') }
      let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

      before do
        publication.file.attach(file)
        publication.update(parent_type: 'ancestry')
      end

      it 'does not call import command', :aggregate_failures do
        expect { service_call }.not_to change(Daggerheart::Homebrews::Ancestry, :count)
        expect(publication.reload.errors_list).not_to eq({})
        expect(ancestry.reload.title['en']).not_to eq "Changed ancestry's title"
      end
    end
  end

  context 'for corrupted file' do
    let(:file_path) { Rails.root.join('spec/fixtures/corrupted_file.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
    end

    it 'does not call import command', :aggregate_failures do
      expect { service_call }.not_to change(Daggerheart::Homebrews::Transformation, :count)
      expect(publication.reload.errors_list).to(
        eq({ '0' => { 'general' => ["expected ',' or ']' after array value at line 31 column 1"] } })
      )
    end
  end

  context 'for invalid file' do
    let(:file_path) { Rails.root.join('spec/fixtures/transformations_invalid.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
    end

    it 'does not call import command', :aggregate_failures do
      expect { service_call }.not_to change(Daggerheart::Homebrews::Transformation, :count)
      expect(publication.reload.errors_list).not_to eq({})
    end
  end
end
