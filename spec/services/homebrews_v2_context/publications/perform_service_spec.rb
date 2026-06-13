# frozen_string_literal: true

describe HomebrewsV2Context::Publications::PerformService do
  subject(:service_call) { described_class.new.call(publication: publication) }

  let!(:publication) { create :homebrew_publication, parent_type: 'transformation' }

  context 'for valid file' do
    let(:file_path) { Rails.root.join('spec/fixtures/transformation.json') }
    let(:file) { Rack::Test::UploadedFile.new(file_path, 'application/json') }

    before do
      publication.file.attach(file)
    end

    it 'calls import command', :aggregate_failures do
      expect { service_call }.to change(Daggerheart::Homebrews::Transformation, :count).by(1)
      expect(publication.reload.errors_list).to eq({})
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
      expect(publication.reload.errors_list).to eq({ '0' => { 'general' => ['Invalid file'] } })
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
