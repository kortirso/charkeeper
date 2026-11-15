# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Feats
        class ChangeCommand < BaseCommand
          KINDABLE_OPTIONS = %w[one_from_list many_from_list].freeze

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/MethodLength, Metrics/PerceivedComplexity
            input[:options] =
              if input.key?(:options) && KINDABLE_OPTIONS.include?(input[:kind])
                input[:options].each_with_object({}) do |option, acc|
                  slug = SecureRandom.uuid
                  feature = option[:feature]
                  next acc[slug] = option unless feature

                  feature[:slug] = slug
                  feature[:user] = input[:user]
                  feature[:origin] = input[:origin]
                  feature[:origin_value] = ''
                  feature[:conditions] ||= {}
                  feature[:conditions][:selected_feature] = slug

                  acc[slug] = { title: option[:title], feature: feature }
                end
              end
            input[:title].transform_values! { |value| sanitize(value) }
            input[:description].transform_values! { |value| sanitize(value) }
            input[:attributes] =
              input.except(:id, :feat, :limit, :level, :options).merge(
                options: input[:options]&.transform_values { |value| value[:title] }
              )
            input[:attributes][:modifiers] = {} unless input.key?(:modifiers)
            input[:attributes][:conditions] ||= {}
            input[:attributes][:conditions][:level] = input[:level] if input.key?(:level)
            input[:attributes][:description_eval_variables] = { limit: input[:limit].to_s } if input.key?(:limit)
          end

          def do_persist(input)
            if input[:feat].options
              ::Pathfinder2::Feat.where(slug: input[:feat].options.keys, user_id: input[:user].id).destroy_all
            end

            input[:feat].update!(input[:attributes])

            input[:options]&.values&.each do |option|
              next unless option[:feature]

              add_feat.call(**option[:feature])
            end

            { result: :ok }
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
