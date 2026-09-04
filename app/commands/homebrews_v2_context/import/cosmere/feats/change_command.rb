# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Feats
        class ChangeCommand < BaseCommand
          KINDABLE_OPTIONS = %w[one_from_list many_from_list].freeze

          private

          def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/MethodLength
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
                  feature[:conditions] = { selected_feature: slug }

                  acc[slug] = { title: option[:title], feature: feature }
                end
              end

            input[:title].transform_values! { |value| sanitize(value) }
            input[:description]&.transform_values! { |value| sanitize(value) }
            input[:info] = { required_for: input[:required_for] }.compact_blank
            input[:attributes] =
              input.except(:id, :feat, :options, :required_for).merge(
                options: input[:options]&.transform_values { |value| value[:title] }
              )
            input[:attributes][:modifiers] = {} unless input.key?(:modifiers)
          end

          def do_persist(input)
            ::Cosmere::Feat.where(slug: input[:feat].options.keys, user_id: input[:user].id).destroy_all if input[:feat].options

            input[:feat].update!(input[:attributes])

            input[:options]&.values&.each do |option|
              next unless option[:feature]

              add_feat_command.call(**option[:feature])
            end

            { result: :ok }
          end

          def add_feat_command = Charkeeper::Container.resolve('commands.homebrews_v2_context.import.cosmere.feats.add')
        end
      end
    end
  end
end
