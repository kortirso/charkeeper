# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Subclasses
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add',
            cache: 'cache.daggerheart_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              subclass = ::Daggerheart::Homebrews::Subclass.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.sort_by { |i| i[:position].to_i }&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'subclass',
                    origin_value: subclass.id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
              subclass
            end

            cache.push_item(key: :subclasses, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
