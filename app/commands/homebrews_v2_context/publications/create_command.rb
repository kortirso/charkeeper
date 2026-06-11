# frozen_string_literal: true

module HomebrewsV2Context
  module Publications
    class CreateCommand < BaseCommand
      use_contract do
        params do
          required(:user).filled(type?: ::User)
          required(:parent_type).filled(:string)
          required(:file)
        end
      end

      private

      def do_persist(input)
        result = ::Homebrew::Publication.create(input.slice(:user, :parent_type))
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
