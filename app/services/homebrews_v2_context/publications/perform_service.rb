# frozen_string_literal: true

module HomebrewsV2Context
  module Publications
    class PerformService
      def call(publication:) # rubocop: disable Metrics/AbcSize
        errors = {}
        JSON.parse(publication.file.download).each_with_index do |object, index|
          result = command_object(publication).call(object.symbolize_keys.merge({ user: publication.user }))
          errors[index.to_s] = result[:raw_errors] if result[:raw_errors]
        end
        publication.update!(errors_list: errors, completed_at: DateTime.now)
      rescue JSON::ParserError => _e
        publication.update!(errors_list: { '0' => { general: ['Invalid file'] } }, completed_at: DateTime.now)
      ensure
        publication.file.purge if publication.file.attached?
      end

      private

      def command_object(publication)
        @command_object ||=
          (%w[HomebrewsV2Context Import] + publication.parent_type.split('::') - ['Homebrews'] + ['AddCommand'])
            .join('::')
            .constantize
            .new
      end
    end
  end
end
