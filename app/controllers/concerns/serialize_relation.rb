# frozen_string_literal: true

module SerializeRelation
  extend ActiveSupport::Concern

  private

  def serialize_relation(relation, serializer, key, serialized_fields={})
    Panko::Response.new(
      key => Panko::ArraySerializer.new(
        relation,
        each_serializer: serializer,
        **serialized_fields
      )
    )
  end
end
