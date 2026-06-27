# frozen_string_literal: true

module HomebrewsV2Context
  module Publications
    class CreateCommand < BaseCommand
      use_contract do
        Providers = Dry::Types['strict.string'].enum('daggerheart', 'dnd2024')

        params do
          required(:user).filled(type?: ::User)
          required(:parent_type).filled(:string)
          required(:file)
          optional(:provider).maybe(Providers)
        end
      end

      private

      def do_persist(input)
        result = ::Homebrew::Publication.create(input.slice(:user, :parent_type, :provider))
        upload_file(result, input)

        HomebrewsV2Context::CreatePublicationJob.perform_later(id: result.id)

        { result: result }
      end

      def upload_file(result, input)
        return unless input[:file]

        result.file.attach(input[:file])
      rescue StandardError => _e
      end
    end
  end
end
